import * as React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Modal, ModalContents, ModalOpenButton} from 'components/modal'
import {Button} from 'components/lib'

test('can be opened and closed', async () => {
  const title = 'Login here'
  const ariaLabel = 'Modal label'
  const contents = 'Example contents'

  render(
    <Modal>
      <ModalOpenButton>
        <Button>Open</Button>
      </ModalOpenButton>
      <ModalContents aria-label={ariaLabel} title={title}>
        {contents}
      </ModalContents>
    </Modal>
  )

  // After clicking to open the modal, the contents should be rendered.
  userEvent.click(screen.getByRole('button', {name: /open/i}))
  const modal = screen.getByRole('dialog')
  const inModal = within(modal)

  expect(modal).toHaveAttribute('aria-label', ariaLabel)
  expect(inModal.getByRole('heading', {name: title})).toBeInTheDocument()
  screen.getByText(contents)

  // After clicking to close, the modal contents should not be rendered.
  userEvent.click(inModal.getByRole('button', {name: /close/i}))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
