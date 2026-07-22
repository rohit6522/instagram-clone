import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Feed />

            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreatePost />
            </Layout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;