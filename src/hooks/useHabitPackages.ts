import { useState, useEffect, useCallback } from 'react';
import { HabitPackage } from '../types';
import { habitPackagesService } from '../services/habitPackages';
import { useToast } from './useToast';

export function useHabitPackages() {
  const [packages, setPackages] = useState<HabitPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await habitPackagesService.fetchPackages();
      setPackages(data);
    } catch (err) {
      addToast('Failed to fetch habit packages', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createPackage = async (name: string, description: string, habits: any[]) => {
    setLoading(true);
    try {
      await habitPackagesService.createPackage(name, description, habits);
      await fetchPackages();
      addToast('Package created successfully', 'success');
    } catch (err) {
      addToast('Failed to create package', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importPackage = async (pkg: HabitPackage) => {
    setLoading(true);
    try {
      await habitPackagesService.importPackage(pkg);
      addToast(`Imported package: ${pkg.name}`, 'success');
    } catch (err) {
      addToast('Failed to import package', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    loading,
    fetchPackages,
    createPackage,
    importPackage
  };
}
