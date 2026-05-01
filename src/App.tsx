import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import SearchPage from './pages/SearchPage'
import DetailPage from './pages/DetailPage'
import PublishPage from './pages/PublishPage'
import DocsPage from './pages/DocsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/:type/:name" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
