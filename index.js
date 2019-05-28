function showDashboard(userName, profileImage, lastLogin, email) {
  document.getElementById('userName').innerText = userName
  document.getElementById('email').innerText = email
  document.getElementById('lastLogin').innerText = lastLogin
  document.getElementById('profileImage').setAttribute('src', profileImage)
  document.getElementById('dashboard').style.display = 'initial'
}

function hideDashboard() {
  document.getElementById('dashboard').style.display = 'none'
}

function showLogin() {
  document.getElementById('login').style.display = 'initial'
}

function hideLogin() {
  document.getElementById('login').style.display = 'none'
}

function setLoader(value) {
  if (value) {
    document.getElementById('login-button').style.display = 'none'
    document.getElementById('loader').style.display = 'initial'
  } else {
    document.getElementById('login-button').style.display = 'initial'
    document.getElementById('loader').style.display = 'none'
  }
}

const incrementLogin = async userId => {
  try {
    const database = firebase.firestore()
    const userData = await database.collection('users').doc(userId)
    await userData.update({
      login_count: firebase.firestore.FieldValue.increment(1)
    })
  } catch (error) {
    UIkit.notification(error, { status: 'danger' })
  }
}

const checkLogin = async userId => {
  try {
    const database = firebase.firestore()
    const doc = await database.collection('users').doc(userId)
    const userData = await doc.data()
    return userData['login_count']
  } catch (error) {
    UIkit.notification(error, { status: 'danger' })
  }
}

const initializeUser = async (name, email, imageUrl, userId) => {
  try {
    const database = firebase.firestore()
    const doc = await database.collection('users').doc(userId)
    await doc.set({
      name,
      email,
      imageUrl,
      login_count: 1
    })
  } catch (error) {
    UIkit.notification(error, { status: 'danger' })
  }
}

const login = async () => {
  try {
    setLoader(true)
    const provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope('profile')

    const result = await firebase.auth().signInWithPopup(provider)

    const {
      displayName: userName,
      photoURL: profileImage,
      metadata: { lastSignInTime },
      email,
      uid
    } = result.user
    // const { isNewUser } = result.additionalUserinfo

    initializeUser(userName, email, profileImage, uid)

    // if ((await checkLogin(uid)) > 3)
    //   throw new Error('You have logged in to many times')

    // await incrementLogin(uid)
  } catch (error) {
    UIkit.notification(error, { status: 'danger' })
  } finally {
    setLoader(false)
  }
}

function logout() {
  firebase.auth().signOut()
  // UIkit.notification('logged out', { status: 'primary' })
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const {
      displayName: userName,
      photoURL: profileImage,
      metadata: { lastSignInTime },
      email
    } = user

    hideLogin()
    showDashboard(userName, profileImage, lastSignInTime, email)
  } else {
    hideDashboard()
    showLogin()
  }
})
