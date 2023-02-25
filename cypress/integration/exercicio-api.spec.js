/// <reference types="cypress" />
var faker = require('faker');
let token
import contrato from '../contracts/usuarios.contract'



describe('Testes da Funcionalidade Usuários', () => {

     before(() => {
          cy.token('admin@qa.com.br', '123456').then(tkn => {
               token = tkn
               cy.log(token)
          })
     });

     it('Deve validar contrato de usuários', () => {
          cy.request('usuarios').then(response => {
               return contrato.validateAsync(response.body)
          })
     });

     it('Deve listar usuários cadastrados', () => {
          cy.request('usuarios')
               .then(response => {
                    expect(response.status).to.equal(200)
               })
     });

     it('Deve cadastrar um usuário com sucesso', () => {
          let nomeFaker = faker.Name.firstName()
          let senhaLoremFaker = faker.Lorem.sentence(1)
          let emailFaker = faker.Internet.email(nomeFaker)
          cy.cadastrarUsuario(nomeFaker, emailFaker, senhaLoremFaker, 'false')
               .then(response => {
                    expect(response.status).to.equal(201)
                    expect(response.body.message).to.contain('Cadastro realizado com sucesso')
               })
     });

     it('Deve validar um usuário com email inválido', () => {
          let nomeFaker = faker.Name.firstName()
          let senhaLoremFaker = faker.Lorem.sentence(1)
          cy.cadastrarUsuario(nomeFaker, 'vinicius.sousa@ebac.com.br', senhaLoremFaker, 'false')
               .then(response => {
                    expect(response.status).to.equal(400)
                    expect(response.body.message).to.contain('Este email já está sendo usado')
               })
     });

     it('Deve editar um usuário previamente cadastrado', () => {
          let nomeFaker = faker.Name.firstName()
          let senhaLoremFaker = faker.Lorem.sentence(1)
          let emailFaker = faker.Internet.email(nomeFaker)
          cy.cadastrarUsuario(nomeFaker, emailFaker, senhaLoremFaker, 'false')
               .then(response => {
                    let id = response.body._id
                    cy.request({
                         method: "PUT",
                         url: `usuarios/${id}`,
                         headers: { autorizarion: token },
                         body: {
                              "nome": nomeFaker,
                              "email": emailFaker,
                              "password": senhaLoremFaker,
                              "administrador": "false"
                         }
                    }).then((response => {
                         expect(response.body.message).to.contain('Registro alterado com sucesso')
                         expect(response.status).to.equal(200)
                    }))
               })
     });

     it('Deve deletar um usuário previamente cadastrado', () => {
          let nomeFaker = faker.Name.firstName()
          let senhaLoremFaker = faker.Lorem.sentence(1)
          let emailFaker = faker.Internet.email(nomeFaker)
          cy.cadastrarUsuario(nomeFaker, emailFaker, senhaLoremFaker, 'false')
               .then(response => {
                    let id = response.body._id
                    cy.request({
                         method: "DELETE",
                         url: `usuarios/${id}`,
                         headers: { autorizarion: token }
                    }).then((response => {
                         expect(response.body.message).to.contain('Registro excluído com sucesso')
                         expect(response.status).to.equal(200)
                    }))
               });
     });
});