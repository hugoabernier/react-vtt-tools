export interface IVTTCleanerState {
  errors?: string[];
  file?: File;
  exportFileName?: string;
  dataToDownload: any[];
  readyToExport: boolean;
}
