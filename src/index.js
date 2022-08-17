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

  const colorMap = products
    .filter(product => !filter.sizeId || product.sizeId === filter.sizeId)
    .reduce((acc, product)=> {
    const key = product.color.id;
    acc[key] = acc[key] || { id: key, count: 0, name: product.color.name };
    acc[key].count++;
    return acc;
  }, {});

  const colorEntries = Object.values(colorMap);
  const sizeMap = products
    .filter(product => !filter.colorId || product.colorId === filter.colorId)
    .reduce((acc, product)=> {
    const key = product.size.id;
    acc[key] = acc[key] || { id: key, count: 0, name: product.size.name };
    acc[key].count++;
    return acc;
  }, {});
  const sizeEntries = Object.values(sizeMap);

  const filtered = products
    .filter(product => !filter.colorId || filter.colorId === product.colorId)
    .filter(product => !filter.sizeId || filter.sizeId === product.sizeId)
  return (
    <div id='search'>
      <section>
        <div>
          <h2>Choose Color</h2>
          <ul>
            {
              colorEntries.map( entry => {
                let newFilter = {...filter, colorId: entry.id};
                if(filter.colorId === entry.id){
                  delete newFilter.colorId;
                }

                newFilter = JSON.stringify(newFilter);
                return (
                  <li key={ entry.id } className={ entry.id === filter.colorId ? 'selected': '' }>
                    <Link to={`/search/${newFilter}`}>
                    { entry.name } ({ entry.count })
                    </Link>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div>
          <h2>Choose Size</h2>
          <ul>
            {
              sizeEntries.map( entry => {
                let newFilter = {...filter, sizeId: entry.id};
                if(filter.sizeId === entry.id){
                  delete newFilter.sizeId;
                }

                newFilter = JSON.stringify(newFilter);
                return (
                  <li key={ entry.id } className={ entry.id === filter.sizeId ? 'selected': '' }>
                    <Link to={`/search/${newFilter}`}>
                    { entry.name } ({ entry.count })
                    </Link>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </section>
      <section>
        <ul>
          {
            filtered.map( product => {
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
