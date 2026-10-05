import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';

export default function AccountScreen() {
  return (
    <ScreenPlaceholder
      title="Account"
      phase="Phase 6 (local account)"
      todos={[
        'Profile name and account details',
        'Sign out / log out',
        'No Figma design yet for this screen',
      ]}
    />
  );
}
