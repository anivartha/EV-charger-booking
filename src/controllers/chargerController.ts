/**
 * Charger Controller
 */
import { Request, Response } from 'express';
import { ChargerNewModel } from '../models/ChargerNew';

export const createCharger = async (req: Request, res: Response): Promise<void> => {
  try {
    const { station_id, charger_type, power_kw } = req.body;

    if (!station_id || !charger_type || !power_kw) {
      res.status(400).json({ error: 'Station ID, charger type, and power (kW) are required' });
      return;
    }

    const charger = await ChargerNewModel.create({
      station_id: parseInt(station_id),
      charger_type,
      power_kw: parseInt(power_kw)
    });

    res.status(201).json({
      success: true,
      message: 'Charger created successfully',
      charger
    });
  } catch (error: any) {
    console.error('Create charger error:', error);
    res.status(500).json({ error: 'Failed to create charger', details: error.message });
  }
};

export const getChargers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { station_id } = req.query;

    let chargers;
    if (station_id) {
      chargers = await ChargerNewModel.findByStation(parseInt(station_id as string));
    } else {
      chargers = await ChargerNewModel.findAll();
    }

    res.json({ chargers });
  } catch (error: any) {
    console.error('Get chargers error:', error);
    res.status(500).json({ error: 'Failed to fetch chargers', details: error.message });
  }
};

export const deleteCharger = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await ChargerNewModel.delete(parseInt(id));

    res.json({
      success: true,
      message: 'Charger deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete charger error:', error);
    res.status(500).json({ error: 'Failed to delete charger', details: error.message });
  }
};

