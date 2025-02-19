import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { fetchAllCollectionsPerLibrary, fetchBibliographyFromCollectionHref } from '../../../helpers/zotero'
import { useGraphQL } from '../../../helpers/graphQL'
import { useProfile } from '../../../helpers/userProfile'
import { linkToZotero as query } from '../../Article.graphql'

import Button from '../../Button'
import Field from '../../Field'
import Combobox from '../../SelectCombobox.jsx'

import styles from './bibliographe.module.scss'
import { Rss, Clipboard } from 'react-feather'

/**
 * @typedef {import('../../SelectCombobox').ComboboxItem} ComboboxItem
 * @typedef {import('../../../helpers/zotero').ZoteroCollection} ZoteroCollection
 */

export default function ZoteroPanel ({ articleId, zoteroLink: initialZoteroLink, onChange }) {
  const zoteroToken = useSelector(state => state.activeUser.zoteroToken)
  const userId = useSelector(state => state.activeUser._id)
  const backendEndpoint = useSelector(state => state.applicationConfig.backendEndpoint)

  const [zoteroLink, setZoteroLink] = useState(initialZoteroLink)
  const [zoteroCollectionHref, setZoteroCollectionHref] = useState(null)
  /**
   * @type {Array.<ZoteroCollection[], function(ZoteroCollection[]): undefined>}
   */
  const [zoteroCollections, setZoteroCollections] = useState([])

  const [isSaving, setSaving] = useState(false)
  const runQuery = useGraphQL()
  const refreshProfile = useProfile()

  const handleZoteroLinkChange = useCallback((event) => setZoteroLink(event.target.value), [])
  const handleZoteroCollectionChange = useCallback((href) => setZoteroCollectionHref(href), [])
  const hasLinkChanged = useMemo(() => initialZoteroLink || initialZoteroLink !== zoteroLink, [zoteroLink])
  const groupedZoteroCollections = useMemo(() => {
    /** @type {ComboboxValue[]} */
    return zoteroCollections.map(({ data, meta, library, links }) => ({
      key: links.self.href,
      name: `${data.name} (${meta.numItems} items)`,
      section: `${library.name} (${library.type})`
    }))
  }, [zoteroCollections])

  const persistZoteroLink = useCallback(async (zoteroLink) => {
    if (!zoteroLink === initialZoteroLink) {
      return
    }

    try {
      const variables = {
        zotero: zoteroLink,
        user: userId,
        article: articleId,
      }
      await runQuery({ query, variables })
    } catch (err) {
      alert(err)
    }
  }, [initialZoteroLink])

  const refreshCollection = useCallback(async (zoteroLink) => {
    if (!zoteroLink) {
      return
    }

    await importCollection({
      collectionHref: `https://api.zotero.org/groups/${zoteroLink}`,
    })
  }, [])


  const handleZoteroLinkFormSubmission = useCallback(async (event) => {
    event.preventDefault()
    const zoteroLink = (new FormData(event.target)).get('zoteroLink')
    setSaving(true)

    await Promise.all([
      persistZoteroLink(zoteroLink),
      refreshCollection(zoteroLink)
    ])

    setSaving(false)
  }, [])

  const handleCollectionFormSubmission = useCallback(async (event) => {
    event.preventDefault()
    setSaving(true)

    await importCollection({
      token: zoteroToken,
      collectionHref: zoteroCollectionHref,
    })

    setSaving(false)
  }, [zoteroCollectionHref])

  const importCollection = useCallback(async ({ token, collectionHref }) => {
    setSaving(true)
    try {
      const result = await fetchBibliographyFromCollectionHref({ token, collectionHref })
      onChange(result.join('\n'))
    } catch (err) {
      console.error(`Something went wrong while fetching bibliography from Zotero: ${collectionHref}`, err)
    } finally {
      setSaving(false)
    }
  }, [])

  const handleZoteroAccountConnection = useCallback(() => {
    const popup = window.open(
      `${backendEndpoint}/login/zotero`,
      'openid',
      'width=660&height=360&menubar=0&toolbar=0'
    )
    const intervalId = setInterval(() => {
      if (popup.closed) {
        refreshProfile()
        clearInterval(intervalId)
      }
    }, 1000)
  }, [])

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchAllCollectionsPerLibrary({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  return <div className={styles.zotero}>
    <form className={styles.section} disabled={isSaving} onSubmit={handleCollectionFormSubmission}>
      <h3><Rss />Import a collection from my account</h3>
      {zoteroToken && <Combobox label="" items={groupedZoteroCollections} value={zoteroCollectionHref} onChange={handleZoteroCollectionChange} />}
      {zoteroToken && (
        <Button type="submit" primary disabled={!zoteroCollectionHref || isSaving}>
          {isSaving
            ? 'Fetching…'
            : 'Replace bibliography with this account collection'}
        </Button>
      )}

      {!zoteroToken && (
        <Button type="button" onClick={handleZoteroAccountConnection}>
          First, connect my Zotero account
        </Button>
      )}
    </form>

    <form className={styles.section} onSubmit={handleZoteroLinkFormSubmission}>
      <h3><Clipboard /> Import by URL</h3>

      <p className={styles.helpText}>
        Please paste the URL of a <em>public</em> Zotero library, so that it looks like<br />

        <code>https://www.zotero.org/groups/<mark>[IDnumber]/collections/[IDcollection]</mark></code> or<br />
        <code>https://www.zotero.org/groups/<mark>[IDnumber]</mark></code>
      </p>
      <Field
        onChange={handleZoteroLinkChange}
        name="zoteroLink"
        placeholder="[IDnumber]/collections/[IDcollection]"
        value={zoteroLink}
        prefix="https://www.zotero.org/groups/"
        autoFocus={true}
      />
      <Button
        type="submit"
        primary={true}
        disabled={isSaving || !hasLinkChanged}
      >
        {isSaving
          ? 'Fetching…'
          : 'Replace bibliography with this collection'}
      </Button>
    </form>
  </div>
}
