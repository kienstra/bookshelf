/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import VisuallyHidden from '@reach/visually-hidden'
import {CircleButton} from 'components/lib'
import {Dialog} from './lib'

const ModalContext = React.createContext()
ModalContext.displayName = 'ModalContext'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args))

function useModal() {
  const context = React.useContext(ModalContext)
  if (context === undefined) {
    throw new Error('must call useModal inside ModalContext.Provider')
  }

  return context
}

function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false)
  return <ModalContext.Provider value={[isOpen, setIsOpen]} {...props} />
}

function ModalDismissButton({children: child}) {
  const [, setIsOpen] = useModal()
  return React.cloneElement(
    child,
    {onClick: callAll( () => setIsOpen(false), child.props.onClick)}
  )
}

function ModalOpenButton({children: child}) {
  const [, setIsOpen] = useModal()
  return React.cloneElement(
    child,
    {onClick: callAll(() => setIsOpen(true), child.props.onClick)}
  )
}

const CircleDismissButton = () => (
  <div css={{display: 'flex', justifyContent: 'flex-end'}}>
    <ModalDismissButton>
      <CircleButton>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden>×</span>
      </CircleButton>
    </ModalDismissButton>
  </div>
)


const ModalContentsBase = ({title}) => (
  <React.Fragment>
    <CircleDismissButton />
    <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
  </React.Fragment>
)

function ModalContents({title, children, ...props}) {
  const [isOpen, setIsOpen] = useModal()
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props}>
      <ModalContentsBase title={title} />
      {children}
    </Dialog>
  )
}

export {Modal, ModalContents, ModalDismissButton, ModalOpenButton}
