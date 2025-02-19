import { Button, Modal as GeistModal, useModal, useToasts } from '@geist-ui/core'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { StopCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useMutation } from '../../hooks/graphql.js'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

import { stopCollaborativeSession } from './CollaborativeSession.graphql'

import styles from './CollaborativeEditorStatus.module.scss'


export default function CollaborativeEditorStatus ({ articleId, websocketStatus, collaborativeSessionCreatorId }) {
  const { t } = useTranslation()
  const mutation = useMutation()
  const { setToast } = useToasts()
  const history = useHistory()
  const activeUser = useSelector(state => ({
    _id: state.activeUser._id,
    email: state.activeUser.email,
    displayName: state.activeUser.displayName,
    username: state.activeUser.username
  }), shallowEqual)

  const {
    visible: collaborativeSessionEndVisible,
    setVisible: setCollaborativeSessionEndVisible,
    bindings: collaborativeSessionEndBinding
  } = useModal()

  const handleEndCollaborativeSession = useCallback(async () => {
    try {
      await mutation({ query: stopCollaborativeSession, variables: { articleId } })
      setToast({
        type: 'default',
        text: 'Collaborative session ended'
      })
      history.push('/articles')
    } catch (err) {
      setToast({
        type: 'error',
        text: 'Unable to stop the collaborative session: ' + err.toString()
      })
    }
  }, [mutation])

  const handleConfirmCollaborativeSessionEnd = useCallback(async () => {
    setCollaborativeSessionEndVisible(true)
  }, [])

  return (<>
    <div className={styles.row}>
      <div className={styles.writers}>
        <CollaborativeEditorWriters/>
      </div>
      <div className={styles.status}>
        <CollaborativeEditorWebSocketStatus status={websocketStatus}/>
      </div>
      {collaborativeSessionCreatorId === activeUser?._id && <Button
        className={clsx(styles.button)}
        type="error"
        ghost
        auto
        scale={0.4} onClick={handleConfirmCollaborativeSessionEnd}
      ><StopCircle/> End collaborative session</Button>}
    </div>
    <GeistModal width="35rem" visible={collaborativeSessionEndVisible} {...collaborativeSessionEndBinding} onClose={handleEndCollaborativeSession}>
      <h2>{t('article.collaborativeSessionEnd.title')}</h2>
      <GeistModal.Content>
        {t('article.collaborativeSessionEnd.confirmMessage')}
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setCollaborativeSessionEndVisible(false)}>
        {t('modal.cancelButton.text')}
      </GeistModal.Action>
      <GeistModal.Action onClick={handleEndCollaborativeSession}>{t('modal.confirmButton.text')}</GeistModal.Action>
    </GeistModal>

  </>)
}

CollaborativeEditorStatus.propTypes = {
  articleId: PropTypes.string.isRequired,
  websocketStatus: PropTypes.string.isRequired,
  collaborativeSessionCreatorId: PropTypes.string.isRequired
}
