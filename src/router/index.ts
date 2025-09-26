import FeedPage from '../pages/FeedPage';
import { ProfilePage } from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import { lazyLoadImgs } from '../utils/lazy-load-img';
import { APP_CONTAINER_CLASSNAME } from '../constant';
import LoginPage from '../pages/LogInPage';
import RegisterPage from '../pages/RegisterPage';
import { isLoggedIn } from '../utils/auth';

const PATHS = {
  login: { url: '/', component: LoginPage },
  feed: { url: '/feed', component: FeedPage, protected: true },
  profile: { url: '/profile', component: ProfilePage, protected: true },
  register: { url: '/register', component: RegisterPage },
} as const;

export default async function router(
  currentPath = '',
  routes = PATHS
): Promise<string | void> {
  const currentRoute = Object.values(routes).find(
    (route) => route.url === currentPath
  );

  if (!currentRoute) return await NotFoundPage();

  // Protected route check
  if ((currentRoute as any).protected && !isLoggedIn()) {
    history.pushState({ path: '/' }, '', '/');
    return await LoginPage();
  }

  // Redirect from root to feed if logged in
  if (currentPath === '/' && isLoggedIn()) {
    history.pushState({ path: '/feed' }, '', '/feed');
    return await FeedPage();
  }

  const container = document.getElementById(APP_CONTAINER_CLASSNAME);
  if (!container) return;

  // DOM-rendering pages (like ProfilePage)
  if ('length' in currentRoute.component && currentRoute.component.length > 0) {
    // If function expects at least 1 argument, pass container
    return await (currentRoute.component as (root: HTMLElement) => Promise<void>)(container);
  }

  // String-returning pages
  return await (currentRoute.component as () => Promise<string>)();
}


export async function renderRoute(path?: string) {
  path = path ?? window.location.pathname;
  const contentContainer = document.getElementById(APP_CONTAINER_CLASSNAME);
  if (!path || !contentContainer) return;

  const loadingScreen = (window as any).loadingScreen;
  if (loadingScreen && (path === '/login' || path === '/register')) {
    loadingScreen.showWithMessage(
      path === '/login' ? 'Loading Sign In...' : 'Loading Registration...'
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const html = await router(path);

  // Only insert HTML if it exists
  if (html) contentContainer.innerHTML = html;

  if (loadingScreen && (path === '/login' || path === '/register')) {
    setTimeout(() => loadingScreen.hideLoadingScreen(), 500);
  }

  lazyLoadImgs();
}
