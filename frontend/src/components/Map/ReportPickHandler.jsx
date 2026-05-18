import { useMapEvents } from 'react-leaflet';

function ReportPickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });

  return null;
}

export default ReportPickHandler;
