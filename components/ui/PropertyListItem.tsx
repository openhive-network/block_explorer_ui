const PropertyListItem: React.FC<{ propKey: string; propValue: any }> = ({ propKey, propValue }) => {
  // Handle URLs as a special case
  if (propKey === 'url' && typeof propValue === 'string' && propValue.startsWith('http')) {
    return (
      <li>
        <strong className="font-semibold">{propKey}:</strong> <a href={propValue} target="_blank" rel="noopener noreferrer" className="text-link break-all">{propValue}</a>
      </li>
    );
  }

  let displayValue: string;

  // This logic is now clean and isolated.
  if ((propKey === 'hbd_exchange_rate' || propKey === 'sbd_exchange_rate')) {
    if (typeof propValue === 'object' && propValue !== null && propValue.base && propValue.quote) {
      displayValue = `${propValue.base} / ${propValue.quote}`;
    } else {
      // The hex string is now handled here. We will display it as-is for now.
      displayValue = String(propValue); 
    }
  } else if (typeof propValue === 'object' && propValue !== null) {
    displayValue = JSON.stringify(propValue);
  } else {
    displayValue = String(propValue);
  }

  return (
    <li>
      <strong className="font-semibold">{propKey}:</strong> <span className="font-mono break-all">{displayValue}</span>
    </li>
  );
};
export default PropertyListItem;