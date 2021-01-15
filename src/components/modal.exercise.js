import * as React from 'react'
import {Dialog} from './lib'

const ModalContext = React.createContext()
ModalContext.displayName = 'ModalContext'

function callAll(event, fns) {
  fns.forEach(fn => {
    if (typeof fn === 'function') {
      fn(event)
    }
  })
}

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
    {onClick: event => callAll(event, [child.props.onClick, () => setIsOpen(false)])}
  )
}

function ModalOpenButton({children: child}) {
  const [, setIsOpen] = useModal()
  return React.cloneElement(
    child,
    {onClick: event => callAll(event, [child.props.onClick, () => setIsOpen(true)])}
  )
}

function ModalContents(props) {
  const [isOpen, setIsOpen] = useModal()
  return <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
}

export {Modal, ModalContents, ModalDismissButton, ModalOpenButton}
