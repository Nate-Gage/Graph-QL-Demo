const express = require('express');
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = express();

const authors = [
    { id: 1, name: 'J. K. Rowling'},
    { id: 2, name: 'C.S. Lewis'},
    { id: 3, name: 'J.R. Tolkien'}
]

const books = [
    { id: 1, name: 'Sorcerers Stone', authorID: 1},
    { id: 2, name: 'Chamber of Secrets', authorID: 1},
    { id: 3, name: 'Prisoner of Azkaban', authorID: 1},
    { id: 4, name: 'Horse and his Boy', authorID: 2},
    { id: 5, name: 'Magicians Nephew', authorID: 2},
    { id: 6, name: 'Last Battle', authorID: 2},
    { id: 7, name: 'Two Towers', authorID: 3},
    { id: 8, name: 'Fellowship of the Ring', authorID: 3}
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This is a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorID: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorID);
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This is the author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorID === author.id);
            }
        } 
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { 
                    id: books.length + 1, 
                    name: args.name, 
                    authorId: args.authorId
                }
                books.push(book)
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const author = { 
                    id: authors.length + 1, 
                    name: args.name, 
                    id: args.id
                }
                authors.push(author)
                return author;
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'Single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of Authors',
            resolve: () => authors
        }
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));
app.listen(5000., () => console.log('Server is up on 5000'));