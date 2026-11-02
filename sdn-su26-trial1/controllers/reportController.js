const Ticket = require('../models/Ticket');

// Question 4: Revenue Report (Admin Only)
// GET /api/reports/revenue
const getRevenueReport = async (req, res) => {
  try {
    const report = await Ticket.aggregate([
      // Only aggregate tickets with status = "paid"
      {
        $match: { status: 'paid' }
      },
      // Join with showtimes to find movieId
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showTimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      {
        $unwind: '$showtime'
      },
      // Join with movies to find movie title
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
      // Group by movie and calculate ticketCount, revenue
      {
        $group: {
          _id: '$movie._id',
          movieTitle: { $first: '$movie.title' },
          ticketCount: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      // Sort by revenue descending
      {
        $sort: { revenue: -1 }
      },
      // Format output fields
      {
        $project: {
          _id: 0,
          movieTitle: 1,
          ticketCount: 1,
          revenue: 1
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

