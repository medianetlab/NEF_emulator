from bson import ObjectId
from pymongo.database import Database
import uuid

# collection
# GET (all objects as a list)
def index(db, collection_name):
    collection = db[collection_name]
    return collection.find({})

# GET (specific object)
def read(db : Database, collection_name, uuId):
    collection = db[collection_name]
    return collection.find_one({'_id': ObjectId(uuId)}, {'_id': False})

# PUT
def update(db: Database, collection_name, uuId, json_data):
    return db[collection_name].replace_one({"_id": ObjectId(uuId)}, json_data)

# POST
def create(db: Database, collection_name, json_data):
    return db[collection_name].insert_one(json_data)

# DELETE
def delete(db: Database, collection_name, uuId):
    result = db[collection_name].delete_one({"_id": ObjectId(uuId)}).deleted_count
    return result

#Add a new field to an existing document
def update_new_field(db: Database, collection_name, uuId, json_data):
    return db[collection_name].update_one({'_id': ObjectId(uuId)} , { '$set' : json_data})

#Read by ipv4
def read_ipv4(db : Database, collection_name, ipv4):
    collection = db[collection_name]
    return collection.find_one({'ipv4Addr': ipv4})
