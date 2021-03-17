import React from 'react'
import { useLocation } from 'react-router-dom'
import App from '../layouts/App'

import styles from '../components/Write/write.module.scss'

export default () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const message = urlSearchParams.get('message') || ''
  return (
    <App layout="fullPage">
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>Error</h2>

          <p>Something wrong happened: <code>{message}</code>.</p>
        </article>
      </section>
    </App>
  )
}
