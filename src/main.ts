import "./styles/profilePage.css";
import "./styles/postsCard.css";
import "./styles/gallery.css";
import { renderProfilePage } from "./pages/ProfilePage";


// Example: render it inside a div with id="root"
const root = document.getElementById('root');
if (root) {
  renderProfilePage(root, 'lyra_novak'); // pass the username to fetch
}
