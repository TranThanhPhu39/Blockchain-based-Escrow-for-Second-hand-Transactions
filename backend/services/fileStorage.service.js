// ============================================================
// services/fileStorage.service.js — Business logic upload/delete file
//
// Tại sao tách ra service thay vì code thẳng trong controller?
// - Controller chỉ xử lý request/response
// - Service chứa business logic → dễ test, dễ tái sử dụng
// - Nếu sau này đổi từ Cloudinary sang S3, chỉ sửa file này
//
// Luồng:
// multer buffer (req.file.buffer)
//   → uploadToCloudinary() → Cloudinary CDN
//   → trả về { url, publicId, fileType }
//   → controller lưu vào MongoDB
// ============================================================

const cloudinary = require('../config/cloudinary');

// ==================== CONSTANTS ====================

// Folder structure trên Cloudinary
// Giúp quản lý file dễ hơn trong Cloudinary Media Library
const CLOUDINARY_FOLDERS = {
  DISPUTE_EVIDENCE: 'escrow/dispute-evidence',  // Bằng chứng buyer
  SELLER_EVIDENCE: 'escrow/seller-evidence',     // Bằng chứng phản bác của seller
  PRODUCT_IMAGES: 'escrow/product-images',       // Ảnh sản phẩm trong escrow
};

// Map từ MIME type sang resource_type cho Cloudinary
// Cloudinary phân biệt: 'image', 'video', 'raw' (cho PDF, doc...)
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw'; // PDF, documents
};

// Map từ MIME type sang fileType lưu vào MongoDB (Dispute schema)
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'document';
};

// ==================== UPLOAD ====================

/**
 * uploadToCloudinary — Upload 1 file buffer lên Cloudinary
 *
 * @param {Buffer} fileBuffer - Buffer từ multer memoryStorage (req.file.buffer)
 * @param {string} mimetype   - MIME type của file (req.file.mimetype)
 * @param {string} folder     - Folder trên Cloudinary (dùng CLOUDINARY_FOLDERS constants)
 * @returns {Promise<{ url: string, publicId: string, fileType: string }>}
 *
 * Tại sao dùng upload_stream thay vì upload()?
 * Vì multer memoryStorage không tạo file trên disk
 * upload() cần file path, upload_stream nhận Buffer/Stream trực tiếp
 */
const uploadToCloudinary = (fileBuffer, mimetype, folder) => {
  return new Promise((resolve, reject) => {
    const resourceType = getResourceType(mimetype);
    const fileType = getFileType(mimetype);

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      // quality: 'auto' — Cloudinary tự tối ưu chất lượng ảnh
      // Giảm dung lượng mà không mất quá nhiều chất lượng
      ...(resourceType === 'image' && { quality: 'auto', fetch_format: 'auto' }),
    };

    // upload_stream: nhận stream và upload lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve({
          url: result.secure_url,      // HTTPS URL — lưu vào MongoDB
          publicId: result.public_id,  // ID để delete sau này
          fileType,                    // 'image' | 'video' | 'document'
        });
      }
    );

    // Pipe buffer vào upload stream
    // Passthrough stream để convert Buffer → ReadableStream
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null); // Signal end of stream
    readableStream.pipe(uploadStream);
  });
};

/**
 * uploadManyToCloudinary — Upload nhiều file cùng lúc (parallel)
 *
 * @param {Array<Express.Multer.File>} files - Mảng files từ multer (req.files)
 * @param {string} folder - Folder đích trên Cloudinary
 * @returns {Promise<Array<{ url, publicId, fileType }>>}
 *
 * Dùng Promise.all để upload song song, không upload tuần tự
 * Tiết kiệm thời gian đáng kể khi upload nhiều file
 */
const uploadManyToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, file.mimetype, folder)
  );

  return Promise.all(uploadPromises);
};

// ==================== DELETE ====================

/**
 * deleteFromCloudinary — Xóa 1 file trên Cloudinary theo publicId
 *
 * @param {string} publicId    - Cloudinary public_id của file cần xóa
 * @param {string} resourceType - 'image' | 'video' | 'raw'
 * @returns {Promise<void>}
 *
 * Khi nào dùng?
 * - Admin xóa bằng chứng không hợp lệ
 * - Escrow bị cancel → xóa ảnh sản phẩm
 * - User upload nhầm, muốn thay thế
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    // result.result === 'ok' nếu xóa thành công
    // result.result === 'not found' nếu file không tồn tại (không throw error)
    return result;
  } catch (error) {
    // Không throw error — việc xóa file thất bại không nên block flow chính
    console.error(`Failed to delete file ${publicId} from Cloudinary:`, error.message);
  }
};

/**
 * deleteManyFromCloudinary — Xóa nhiều file theo danh sách evidence
 *
 * @param {Array<{ publicId: string, fileType: string }>} evidenceList
 * @returns {Promise<void>}
 *
 * Dùng khi xóa toàn bộ bằng chứng của một dispute
 */
const deleteManyFromCloudinary = async (evidenceList) => {
  if (!evidenceList || evidenceList.length === 0) return;

  const deletePromises = evidenceList.map((evidence) => {
    const resourceType = getResourceType(
      evidence.fileType === 'video' ? 'video/' :
      evidence.fileType === 'document' ? 'application/' : 'image/'
    );
    return deleteFromCloudinary(evidence.publicId, resourceType);
  });

  await Promise.allSettled(deletePromises); // allSettled: không fail nếu 1 cái lỗi
};

// ==================== EXPORTS ====================

module.exports = {
  uploadToCloudinary,
  uploadManyToCloudinary,
  deleteFromCloudinary,
  deleteManyFromCloudinary,
  CLOUDINARY_FOLDERS,
};