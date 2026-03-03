import React from 'react'
import styles from './nav.module.css'

function Nav() {
  return (
    <main className={styles.navbar}>
        <div className={styles.inputcont}><input type="text" /></div> 
           <div className={styles.navprofile}>
            <p>my name</p>
           <div className={styles.navimgcont}></div>
        </div>
    </main>
  )
}

export default Nav