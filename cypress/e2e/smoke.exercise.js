import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()
    cy.visit('/')
    cy.findByRole('button', {name: /register/i}).click()

    cy.findByRole('dialog').within(() => {
      cy.findByLabelText(/username/i).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: 'Discover'}).click()
    })

    const bookTitle = 'Voice of War'
    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox', {name: /search/i}).type(`${bookTitle}{enter}`)
      cy.findByRole('listitem').within(() => {
        cy.findByRole('button', {name: /add to list/i}).click()
      })
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: 'Reading List'}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('link', {name: bookTitle}).click()
    })

    const notes = 'Here are some example notes'
    cy.findByRole('textbox', {name: /notes/i}).type(notes)
    cy.findByLabelText(/loading/i).should('exist')
    cy.findByLabelText(/loading/i).should('not.exist')
    cy.findByRole('button', {name: /mark as read/i}).click()
    cy.findByLabelText(/5/).click({force: true})
    cy.findByRole('button', {name: /mark as unread/i}).should('exist')
    cy.findByRole('link', {name: 'Finished Books'}).click()

    cy.findByRole('main').within(() => {
      cy.findByRole('listitem').should('have.length', 1)
    })
    cy.findByLabelText(/5/).should('be.checked')

    cy.findByRole('link', {name: bookTitle}).click()
    cy.findByRole('button', {name: /remove from list/i}).click()
    cy.findByRole('textbox', {name: /notes/i}).should('not.exist')
    cy.findByRole('radio', {name: /stars/i}).should('not.exist')
    cy.findByRole('link', {name: 'Finished Books'}).click()

    cy.findByRole('main').within(() => {
      cy.findByRole('listitem').should('not.exist')
    })
  })
})
