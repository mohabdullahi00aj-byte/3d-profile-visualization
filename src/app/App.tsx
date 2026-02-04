import { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { DataVisualization } from '@/app/components/DataVisualization';
import { fetchGoogleSheetData, PersonData } from '@/app/utils/googleSheets';
import { LogOut } from 'lucide-react';

const GOOGLE_CLIENT_ID = '119704642625-c0pm1nooff8kfkqvt5kh57efpi17bgea.apps.googleusercontent.com';

type Layout = 'table' | 'sphere' | 'helix' | 'grid' | 'tetrahedron';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [data, setData] = useState<PersonData[]>([]);
  const [layout, setLayout] = useState<Layout>('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sheetData = await fetchGoogleSheetData();
      console.log('Loaded data:', sheetData.length, 'records');
      setData(sheetData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Ensure we have data even if fetch fails
      const sheetData = await fetchGoogleSheetData();
      setData(sheetData);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login Success:', credentialResponse);
    
    // Decode JWT token to get user info
    if (credentialResponse.credential) {
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userInfo = JSON.parse(jsonPayload);
      setUserData(userInfo);
    }
    
    setIsAuthenticated(true);
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  const handleDemoLogin = () => {
    // Demo login for testing
    setUserData({ 
      name: 'Demo User', 
      email: 'demo@example.com',
      picture: 'https://via.placeholder.com/40x40/4285f4/ffffff?text=DU'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setData([]);
  };

  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">3D Data Explorer</h1>
              <p className="text-gray-300">Sign in to visualize your data</p>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  theme="filled_blue"
                  size="large"
                />
              </div>
              
              <div className="text-center text-sm text-gray-400 mt-4">
                <p>Visualize data in 4 stunning formats:</p>
                <div className="flex gap-2 justify-center mt-2 flex-wrap">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Table</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Sphere</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs">Double Helix</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs">3D Grid</span>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="relative w-screen h-screen overflow-hidden">
        {/* Controls overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-none">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">3D Data Explorer</h1>
              {userData && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  {userData.picture && (
                    <img src={userData.picture} alt={userData.name} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-white text-sm">{userData.name}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors pointer-events-auto"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Layout controls */}
        <div className="absolute top-24 left-6 z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 pointer-events-auto">
          <h3 className="text-white font-semibold mb-3 text-sm">Layout</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setLayout('table')}
              className={`px-4 py-2 rounded-lg transition-all ${
                layout === 'table'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Table 
            </button>
            <button
              onClick={() => setLayout('sphere')}
              className={`px-4 py-2 rounded-lg transition-all ${
                layout === 'sphere'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Sphere
            </button>
            <button
              onClick={() => setLayout('helix')}
              className={`px-4 py-2 rounded-lg transition-all ${
                layout === 'helix'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
               Helix
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                layout === 'grid'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Grid 
            </button>
            <button
              onClick={() => setLayout('tetrahedron')}
              className={`px-4 py-2 rounded-lg transition-all ${
                layout === 'tetrahedron'
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Tetrahedron
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-24 right-6 z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 pointer-events-auto">
          <h3 className="text-white font-semibold mb-3 text-sm">Net Worth</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-white text-sm">&lt; $100K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-white text-sm">$100K - $200K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="text-white text-sm">&gt; $200K</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl border border-white/20 pointer-events-auto">
          <p className="text-white text-sm">
            {loading ? 'Loading data...' : `Displaying ${data.length} records`}
          </p>
        </div>

        {/* Visualization */}
        {!loading && data.length > 0 && (
          <DataVisualization data={data} layout={layout} />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading data...</p>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
