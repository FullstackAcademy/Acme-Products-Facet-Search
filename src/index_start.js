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
  const { filterString } = useParams();
  const filter = filterString ? JSON.parse(filterString) : {};

  const colorMap = products
    .filter(product => !filter.size || filter.size === product.sizeId)
    .reduce((acc, product)=> {
    const key = product.colorId;
    acc[key] = acc[key] || { id: product.colorId, name: product.color.name, count: 0 };
    acc[key].count++;
    return acc;
  }, {});

  const colors = Object.values(colorMap);

  const sizeMap = products
    .filter(product => !filter.color || filter.color === product.colorId)
    .reduce((acc, product)=> {
    const key = product.sizeId;
    acc[key] = acc[key] || { id: product.sizeId, name: product.size.name, count: 0 };
    acc[key].count++;
    return acc;
  }, {});

  const sizes = Object.values(sizeMap);

  const filtered = products
    .filter(product => !filter.color || filter.color === product.colorId)
    .filter(product => !filter.size || filter.size === product.sizeId)

  return (
    <div id='search'>
      <section>
        <div>
          <h1>Color Facet</h1>
          <ul>
            {
              colors.map( color => {
                const _filter = {...filter };
                if(filter.color === color.id){
                  delete _filter.color;
                }
                else {
                  _filter.color = color.id;
                }
                return (
                  <li key={ color.id } style={{ fontWeight: filter.color === color.id ? 'bold': ''}}>
                    <Link to={ `/${JSON.stringify(_filter)}`}>
                    { color.name } ({ color.count })
                    </Link>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div>
          <h1>Size Facet</h1>
          <ul>
            {
              sizes.map( size => {
                const _filter = {...filter };
                if(filter.size === size.id){
                  delete _filter.size;
                }
                else {
                  _filter.size = size.id;
                }
                return (
                  <li key={ size.id } style={{ fontWeight: filter.size === size.id ? 'bold': ''}}>
                    <Link to={ `/${JSON.stringify(_filter)}`}>
                    { size.name } ({ size.count })
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
            <Route path='/:filterString' element={ <Search /> } />
          </Routes>
        </main>
      </div>
    );
}

const root = createRoot(document.querySelector('#root'));

root.render(<Provider store={ store }><Router><App /></Router></Provider>);
