import { ObjectId } from 'mongodb';
import { database } from '../mongoDB.js';

export async function productInCartController(req, res) {

    const infosRefreshCart = req.body
    console.log(infosRefreshCart)

    try {

        const findCartOfProduct = await database.collection('cart').findOne({ userId: infosRefreshCart.userId, productId: new ObjectId(infosRefreshCart.productId) });
        if (findCartOfProduct) {
            console.log("findCartOfProduct.qtt: ", findCartOfProduct.qtt)
            if (infosRefreshCart.action === 'add') {
                findCartOfProduct.qtt = findCartOfProduct.qtt + infosRefreshCart.qtt;
            } else {
                findCartOfProduct.qtt = findCartOfProduct.qtt - infosRefreshCart.qtt;
            }

            if(findCartOfProduct.qtt <= 0){
                await database.collection('cart').deleteOne({ userId: infosRefreshCart.userId, productId: new ObjectId(infosRefreshCart.productId) });
                return;
            }
            findCartOfProduct.priceCart = findCartOfProduct.qtt * findCartOfProduct.price;

            await database.collection('cart').updateOne({ 
                userId: infosRefreshCart.userId, 
                productId: new ObjectId(infosRefreshCart.productId) 
            }, { $set: {
                qtt : findCartOfProduct.qtt,
                priceCart : findCartOfProduct.priceCart
            } })
            return res.sendStatus(201)
        }

        const product = await database.collection("products").findOne({_id: new ObjectId(infosRefreshCart.productId)})

        let productId = product._id;
        delete product._id
        await database.collection('cart').insertOne({ 
            ...product, 
            productId: productId, 
            userId: infosRefreshCart.userId,
            qtt: infosRefreshCart.qtt,
            priceCart: product.price * infosRefreshCart.qtt
        });
   
        return res.sendStatus(200)

    } catch (e) {
        console.log("Caiu no catch", e)
        return res.send(e)
    }

} 