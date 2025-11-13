/**
 * Admin Controller
 */
import { Request, Response } from 'express';
import { query } from '../config/database';
import { StationModel } from '../models/Station';
import { BookingNewModel } from '../models/BookingNew';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get total stations
    const stations = await StationModel.findAll();
    const totalStations = stations.length;

    // Get total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total revenue (sum from all stations)
    const totalRevenue = stations.reduce((sum, s) => sum + parseFloat(s.total_revenue.toString()), 0);

    // Get active bookings
    const bookings = await BookingNewModel.findAll();
    const activeBookings = bookings.filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;

    res.json({
      total_stations: totalStations,
      total_users: totalUsers,
      total_revenue: totalRevenue,
      active_bookings: activeBookings
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
};

