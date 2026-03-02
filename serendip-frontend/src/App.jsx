import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
<<<<<<< Updated upstream
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className='text-amber-300'>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
=======
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
            {/* Navbars */}
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            
            {/* Main Content */}
            <main className={`${!isMobile ? 'pt-16' : ''} pb-16 md:pb-0 transition-all duration-300`}>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/*<Route path="/" element={<TouristMap />} />*/}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {/*<Route 
                    path="/favorites" 
                    element={
                      <ProtectedRoute>
                        <TouristMap favoritesView />
                      </ProtectedRoute>
                    } 
                  />*/}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <div>Profile Page (Coming Soon)</div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <div>Settings Page (Coming Soon)</div>
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>

            {/* Mobile Navigation */}
            {isMobile && (
              <Suspense fallback={null}>
                <MobileNav />
              </Suspense>
            )}

            {/* Toast Notifications */}
            <Toaster
              position={isMobile ? 'top-center' : 'bottom-right'}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: isMobile ? '12px' : '16px',
                  fontSize: isMobile ? '14px' : '16px',
                },
              }}
            />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
>>>>>>> Stashed changes
}

export default App
