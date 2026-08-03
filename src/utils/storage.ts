import { RentalOrder } from '../types';
import { formatInputDate } from './formatters';

const STORAGE_KEYS = {
  RENTAL_ORDERS: 'suit_shop_rentals_v3',
  LANGUAGE_MODE: 'suit_shop_bilingual_v2',
};

export const getInitialSampleData = (): RentalOrder[] => {
  return [];
};

export const loadStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
    return fallback;
  }
};

export const saveStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
};

export const exportDatabaseJSON = (orders: RentalOrder[]) => {
  const exportObject = {
    app: 'SuitShopRentalManager',
    exportedAt: new Date().toISOString(),
    data: orders,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportObject, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `suit_rentals_backup_${formatInputDate(new Date())}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export { STORAGE_KEYS };
