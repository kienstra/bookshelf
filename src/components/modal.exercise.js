import * as React from 'react'
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

function ModalContents(props) {
  const [isOpen, setIsOpen] = useModal()
  return <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
}

export {Modal, ModalContents, ModalDismissButton, ModalOpenButton}
