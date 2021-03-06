const Home = require('../frontend/pages/home/Home.vue');
const Deposit = require('../frontend/pages/deposit/Deposit.vue');
const Browse = require('../frontend/pages/browse/Browse.vue');
const ListForWebsite = require('../frontend/pages/list_for_website/ListForWebsite.vue');
const Search = require('../frontend/pages/search/Search.vue');
const View = require('../frontend/pages/view/View.vue');
const Project = require('../frontend/pages/project/Project.vue');
const About = require('../frontend/pages/about/About.vue');
const Help = require('../frontend/pages/help/Help.vue');
const News = require('../frontend/pages/news/News.vue');
const Events = require('../frontend/pages/events/Events.vue');
const NewsPage = require('../frontend/pages/news/NewsPage.vue');
const ForumDiscussion = require('../frontend/pages/forum/ForumDiscussion.vue');
const ForumThread = require('../frontend/pages/forum/Forum.vue');
const UserProfile = require('../frontend/pages/user_profile/UserProfile.vue');
const UserFavorites = require('../frontend/pages/user_favorites/UserFavorites.vue');
const UserList = require('../frontend/pages/user_list/UserList.vue');
const LoginView = require('../frontend/pages/login/Login.vue');
const LoginChoiceView = require('../frontend/pages/login_choice/LoginChoice.vue');

module.exports = {
    '/': Home,
    '/browse': Browse,
    '/search': Search,
    '/project': Project,
    '/view/:id': View,
    '/u/:id/profile': UserProfile,
    '/a/:id/profile': UserProfile,
    '/deposit': Deposit,
    '/about': About,
    '/help': Help,
    '/news': News,
    '/news/:id': NewsPage,
    '/events': Events,
    '/events/:id': Events,
    '/forum': ForumDiscussion,
    '/forum/thread/:id': ForumThread,
    '/login': LoginView,
    '/login/choice': LoginChoiceView,
    '/user_list': UserList,
    '/list': ListForWebsite,
};
