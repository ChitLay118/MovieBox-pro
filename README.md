# 🎬 WY MovieBox - Enhanced Edition (v6.0)

A modern, feature-rich movie streaming application built with **Vanilla JavaScript**, **Tailwind CSS**, and **Firebase**. Watch movies, manage favorites, and enjoy a seamless viewing experience.

## ✨ Features

### Core Features
- 🎥 **Video Streaming** - Watch movies directly in the app
- ⭐ **Favorites Management** - Save and manage your favorite movies
- 🔍 **Advanced Search** - Real-time search functionality
- 🌙 **Dark/Light Mode** - Toggle between themes
- 🌐 **Multi-language Support** - Myanmar and English languages

### User Features
- 👤 **User Authentication** - Secure login and registration with Firebase
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- 🔔 **Notifications** - Real-time notifications from admins
- 💾 **Local Storage** - Persistent favorites and settings

### Admin Features
- 📢 **Notification Management** - Send notifications to all users
- 🎬 **Video Management** - Add and manage video content
- 📺 **Advertisement Management** - Upload and manage ads
- 👥 **User Management** - View all registered users
- 📊 **Admin Dashboard** - Comprehensive admin panel

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Firebase account (for backend services)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ChitLay118/MovieBox-pro.git
cd MovieBox-pro
```

2. **Configure Firebase:**
   - Update `firebase-config.js` with your Firebase credentials
   - Ensure Firestore database is set up with the following collections:
     - `users` - User profiles
     - `notifications` - Admin notifications
     - `videos` - Video content
     - `advertisements` - Ad content

3. **Open in browser:**
   - Open `index.html` in your web browser
   - Or deploy to a web server

### Default Admin Account
- **Email:** `yan260702@gmail.com`
- **Role:** Administrator

## 📁 Project Structure

```
MovieBox-pro/
├── index.html              # Main HTML file
├── style.css               # Enhanced CSS styles
├── script.js               # Main application logic
├── auth.js                 # Authentication module
├── admin.js                # Admin functions
├── ad-manager.js           # Advertisement management
├── firebase-config.js      # Firebase configuration
├── data.json               # Local video data
└── README.md               # This file
```

## 🎯 Usage

### For Users
1. **Register/Login** - Create an account or sign in
2. **Browse Movies** - Select categories to view movies
3. **Search** - Use the search feature to find specific movies
4. **Watch** - Click on a movie to start watching
5. **Add to Favorites** - Click the heart icon to save favorites
6. **Manage Settings** - Change language and theme preferences

### For Admins
1. **Login** with admin account
2. **Navigate to Admin Panel** - Click the admin button in navigation
3. **Send Notifications** - Compose and send messages to all users
4. **Manage Videos** - Add new video content
5. **Manage Ads** - Upload promotional content
6. **View Users** - See all registered users

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Realtime Database)
- **Icons:** SVG
- **Video Player:** Embedded iframe player

## 📊 Version History

### v6.0 (Current)
- ✨ Modernized UI/UX with smooth animations
- 🔍 Advanced search functionality
- 📢 Enhanced notification system
- 🎬 Improved ad management with caching
- ⚡ Better error handling and performance
- 📱 Improved responsive design

### v5.1
- 🔔 Notification sidebar
- 👤 Modern profile settings
- 🎨 Enhanced styling

### v5.0
- Initial release with core features

## 🔒 Security Features

- ✅ Firebase Authentication for secure login
- ✅ Admin role verification
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ Secure data storage with Firestore

## 🐛 Known Issues & Limitations

- Ad display limited to once per day per user
- Video playback depends on embedded player availability
- Search results limited to 10 items
- Admin features only available to verified admins

## 📝 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update credentials in `firebase-config.js`

### Customization
- **Colors:** Edit CSS variables in `style.css`
- **Languages:** Add translations to `data.json`
- **Categories:** Modify categories in `data.json`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: `yan260702@gmail.com`

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Tailwind CSS for styling framework
- Community contributors and testers

## 🎓 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

## 📈 Performance Tips

- **Clear Browser Cache** - If experiencing issues
- **Use Modern Browser** - For best performance
- **Check Internet Speed** - Ensure stable connection
- **Disable Ad Blockers** - May affect ad display

## 🔄 Update Instructions

To update to the latest version:
1. Pull the latest changes: `git pull origin main`
2. Clear browser cache
3. Refresh the page

## 🎉 Changelog

### Recent Updates
- Enhanced search functionality
- Improved ad management system
- Better error handling
- Modernized UI components
- Performance optimizations

---

**Made with ❤️ by WY MovieBox Team**

Last Updated: April 2026
