import { FiDownload, FiUpload } from "react-icons/fi";
import { formatNumber } from "./formatters";

const SpeedTiles = ({ downloadSpeed, uploadSpeed }) => (
  <section className="results-row">
    <div className="stat-block download">
      <div className="stat-label">
        <FiDownload />
        <span>Download</span>
      </div>
      <div className="stat-value">
        {formatNumber(downloadSpeed)}
        <span className="stat-unit">Mbps</span>
      </div>
    </div>
    <div className="stat-block upload">
      <div className="stat-label">
        <FiUpload />
        <span>Upload</span>
      </div>
      <div className="stat-value">
        {formatNumber(uploadSpeed)}
        <span className="stat-unit">Mbps</span>
      </div>
    </div>
  </section>
);

export default SpeedTiles;
