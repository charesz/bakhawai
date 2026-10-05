import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';

export default function RecordsScreen() {
  return (
    <ScreenPlaceholder
      title="Records History"
      phase="Phase 2 (screen) and Phase 3 (saved on the phone)"
      todos={[
        'List of past assessments with search and filter',
        'Use recordsService from src/services',
        'Tap a record to open its report',
      ]}
    />
  );
}
