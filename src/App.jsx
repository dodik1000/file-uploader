import FileUploader from './components/FileUploader/FileUploader';

export default function App() {
  return (
    <div
      style={{
        padding: '60px 20px',
        background: '#f5f7fa',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <FileUploader />
    </div>
  );
}
