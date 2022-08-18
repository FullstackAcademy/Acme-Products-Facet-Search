const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
const express = require('express');
const app = express();
const path = require('path');


app.use('/dist', express.static('dist'));
app.use('/assets', express.static('assets'));

app.get('/', (req, res, next)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/products', async(req, res, next)=> {
  try {
    res.send(await Product.findAll({
      include: [
        Color, Size
      ]
    }));
  }
  catch(ex){
    next(ex);
  }
});

const Product = conn.define('product', {
  name: {
    type: Sequelize.STRING
  },
  inStock: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

const Color = conn.define('color', {
  name: {
    type: Sequelize.STRING
  }
});

const Size = conn.define('size', {
  name: {
    type: Sequelize.STRING
  }
});

Product.belongsTo(Size);
Product.belongsTo(Color);

const setup = async()=> {
  try {
    await conn.sync({ force: true });
    const [red, blue, green, sm, md, lg] = await Promise.all([
      ...['red', 'blue', 'green'].map( name => Color.create({ name })),
      ...['sm','md','lg'].map(name => Size.create({ name }))
    ]);
    await Promise.all([
      Product.create({ name: 'foo', colorId: red.id, sizeId: sm.id, inStock: false}),
      Product.create({ name: 'bar', colorId: blue.id, sizeId: md.id}),
      Product.create({ name: 'bazz', colorId: blue.id, sizeId: lg.id}),
      Product.create({ name: 'quq', colorId: blue.id, sizeId: lg.id}),
      Product.create({ name: 'quux', colorId: green.id, sizeId: sm.id}),
      Product.create({ name: 'glorb', colorId: green.id, sizeId: lg.id}),
      Product.create({ name: 'klork', colorId: green.id, sizeId: lg.id}),
      Product.create({ name: 'gulp', colorId: green.id, sizeId: md.id}),
    ]);
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));

  }
  catch(ex){
    console.log(ex);
  }
};

setup();
