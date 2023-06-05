import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import logger from 'redux-logger';
import axios from 'axios';
import { useParams, Routes, Route, HashRouter as Router, Link } from 'react-router-dom';
import thunk from 'redux-thunk';

const productsReducer = (state=[], action)=> {
  if(action.type === 'SET_PRODUCTS'){
    return action.products;
  }
  return state;
};

const fetchProducts = ()=> {
  return async(dispatch)=> {
    const products = (await axios.get('/products')).data;
    dispatch({type: 'SET_PRODUCTS', products});
  }
};

const reducer = combineReducers({
  products: productsReducer
});

const store = createStore(reducer, applyMiddleware(thunk, logger));


const Search = ()=> {
  const { products } = useSelector(state => state);

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
}


const App = ()=> {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state);
  React.useEffect(()=> {
    dispatch(fetchProducts());
  }, []);
    return (
      <div>
        <nav>
          <Link to='/'>Home</Link>
        </nav>
        <main>
          <h1>Acme Products ({ products.length })</h1>
          <Routes>
            <Route path='/' element={ <Search /> } />
          </Routes>
        </main>
      </div>
    );
}

const root = createRoot(document.querySelector('#root'));

root.render(<Provider store={ store }><Router><App /></Router></Provider>);
