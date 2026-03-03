import React from 'react'
import styles from "./sidebar.module.css"
function SideBar() {
  return (
    <main className={styles.sidebar}>
        <div className={styles.profile}>
            <div className={styles.imgcont}></div>
            <h1>CONNECTIVE</h1>
        </div>
        <nav className={styles.nav}>
        <ul>
          <li>Dashboard</li>
          <li>Profile</li>
          <li>Settings</li>
          <li>Logout</li>
        </ul>
      </nav>
      <div className={styles.footer}>
        <div className={styles.footerbtn}>ADD SOMETHING LATER</div>
      </div>
    </main>
    
  )
}

export default SideBar