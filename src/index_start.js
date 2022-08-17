import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import logger from 'redux-logger';
import axios from 'axios';
import { Route, HashRouter as Router, Link } from 'react-router-dom';

const productsReducer = (state=[], action)=> {
  if(action.type === 'SET_PRODUCTS'){
    return action.products;
  }
  return state;
};

const reducer = combineReducers({
  products: productsReducer
});

const store = createStore(reducer, applyMiddleware(logger));

const Search = connect(
  state => {
    return {
      products: state.products
    };
  }
)(({ products, match })=> {
  const filter = match.params.filter ? JSON.parse(match.params.filter): {};

  return (
    <div id='search'>
      <section>
        <div>
          <h1>Color Facet</h1>
        </div>
        <div>
          <h1>Size Facet</h1>
        </div>
      </section>
      <section>
        <ul>
          {
            products.map( product => {
              return (
                <li
                  key={ product.id}
                  style={{
                    color: product.color.name,
                    fontSize: {
                      lg: '3rem',
                      md: '2rem',
                      sm: '1rem'
                    }[product.size.name]
                  }}
                >
                  { product.name }
                </li>
              );
            })
          }
        </ul>
      </section>
    </div>
  );
});

const App = connect(
  state => {
    return {
      count: state.products.length
    };
  },
  dispatch => {
    return {
      fetchProducts: async()=> {
        const products = (await axios.get('/products')).data;
        dispatch({type: 'SET_PRODUCTS', products});
      }
    };
  }
)(class App extends Component{
  componentDidMount(){
    this.props.fetchProducts();
  }
  render(){
    const { count } = this.props;
    return (
      <div>
        <nav>
          <Link to='/'>Home</Link>
          <Link to='/search'>Search</Link>
        </nav>
        <main>
          <h1>Acme Products ({ count })</h1>
          <Route path='/Search/:filter?' component={ Search } />
        </main>
      </div>
    );
  }
});

const root = createRoot(document.querySelector('#root'));

root.render(<Provider store={ store }><Router><App /></Router></Provider>);
