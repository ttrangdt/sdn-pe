/**
 * ============================================================================
 * COMPONENT: ADVANCED MONGODB AGGREGATION PIPELINE
 * File: controllers/reportController.js
 * ============================================================================
 * Dùng cho các câu hỏi thống kê, báo cáo doanh thu, gom nhóm dữ liệu (GroupBy):
 * 1. $match: Lọc vé đã thanh toán (status = 'paid')
 * 2. $lookup: Nối sang bảng Showtimes
 * 3. $unwind: Trải phẳng mảng
 * 4. $lookup: Nối sang bảng Movies
 * 5. $group: Gom nhóm theo Phim, tính tổng số vé ($sum: 1) và tổng doanh thu ($sum: '$price')
 * 6. $sort: Sắp xếp giảm dần theo doanh thu
 * 7. $project: Định dạng các trường trả về
 */

const Ticket = require('../models/Ticket');

const getRevenueReport = async (req, res) => {
  try {
    const report = await Ticket.aggregate([
      // Bước 1: Lọc các bản ghi thỏa mãn điều kiện
      {
        $match: {
          status: 'paid' // Chỉ tính các vé đã thanh toán
        }
      },

      // Bước 2: Nối sang bảng showtimes
      {
        $lookup: {
          from: 'showtimes',        // Tên collection trong MongoDB
          localField: 'showTimeId', // Khóa ngoại trong Ticket
          foreignField: '_id',      // Khóa chính trong Showtime
          as: 'showtime'            // Tên mảng kết quả nối
        }
      },
      {
        $unwind: '$showtime'        // Trải phẳng mảng thành object
      },

      // Bước 3: Nối sang bảng movies từ showtime.movieId
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      {
        $unwind: '$movie'
      },

      // Bước 4: Gom nhóm theo Movie và tính toán
      {
        $group: {
          _id: '$movie._id',
          movieTitle: { $first: '$movie.title' }, // Lấy tên phim
          ticketCount: { $sum: 1 },              // Đếm số lượng vé
          revenue: { $sum: '$price' }             // Tính tổng tiền
        }
      },

      // Bước 5: Sắp xếp giảm dần theo doanh thu (revenue: -1)
      {
        $sort: { revenue: -1 }
      },

      // Bước 6: Định dạng lại các trường hiển thị ra JSON
      {
        $project: {
          _id: 0,          // Ẩn trường _id
          movieTitle: 1,   // Giữ trường movieTitle
          ticketCount: 1,  // Giữ trường ticketCount
          revenue: 1       // Giữ trường revenue
        }
      }
    ]);

    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRevenueReport
};

