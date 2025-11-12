/**
 * Station Controller
 */
import { Request, Response } from 'express';
import { StationModel } from '../models/Station';

export const createStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { station_name, location } = req.body;

    if (!station_name || !location) {
      res.status(400).json({ error: 'Station name and location are required' });
      return;
    }

    const station = await StationModel.create({ station_name, location });

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      station
    });
  } catch (error: any) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Failed to create station', details: error.message });
  }
};

export const getStations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stations = await StationModel.findAll();
    res.json({ stations });
  } catch (error: any) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Failed to fetch stations', details: error.message });
  }
};

export const deleteStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await StationModel.delete(parseInt(id));

    res.json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Failed to delete station', details: error.message });
  }
};

