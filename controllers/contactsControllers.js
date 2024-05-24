// import contactsService from "../services/contactsServices.js";
import Contact from "../models/contact.js";
export const getAllContacts = async (req, res, next) => {
    console.log({user: req.user});
    try {
        const contacts = await Contact.find({owner: req.user.id});
        res.status(200).send(contacts); 
    } catch (error) {
       next(error);
    }

};

export const getOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findOne({_id: id, owner: req.user.id});
      if (contact === null ) return res.status(404).send({message: "Contact not found"})  
        res.status(200).send(contact) 

    } catch (error) {
        res.status(404).send({message: "Not found"}) 
    }
};

export const deleteContact = async (req, res) => {
    try {
      const { id } = req.params;
      const contactDelete = await Contact.findByIdAndDelete(id);
      if (contactDelete.id === id) 
        res.status(200).send(contactDelete); 
    } catch (error) {
        res.status(404).send({message: "Not found"})  
    }
};

export const createContact = async (req, res) => {
    const createContact = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        owner: req.user.id,
    }
    try {
      const contact = await Contact.create(createContact);
      res.status(201).send(contact);
    } catch (error) {
        res.status(404).send({message: error.message})   
    }

};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateContact = req.body
        if (Object.keys(updateContact).length === 0) {
           return res.status(400).send({message: "Body must have at least one field"})
        }
   
      const contact = await Contact.findByIdAndUpdate(id, updateContact, { new: true })

      if (!contact) {
        return res.status(404).send({"message": "Contact Not Found"});
    }
      res.status(200).send(contact);
    } catch (error) {
        res.status(404).send({message: error.message}) 
    }
};

export const updateStatusContact = async (req, res, next) => {
    try {
     const {id} = req.params;  
     const updateContact = req.body
     if (Object.keys(updateContact).length === 0) {
        return res.status(400).send({message: "Body must have a 'favorite' field"})
     }
     const contact = await Contact.findByIdAndUpdate(id, updateContact, { new: true });
     if (!contact) {
        return res.status(404).send({"message": "Contact Not Found"});
    }
     res.status(200).send(contact);
    } catch (error) {
       res.status(404).send({message: error.message}) 
    }
}