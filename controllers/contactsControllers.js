import contactsService from "../services/contactsServices.js";
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await contactsService.listContacts();
        res.status(200).send(contacts); 
    } catch (error) {
       res.status(500).send({"message": "Internal server error"}) 
    }

};

export const getOneContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactsService.getContactById(id);
      if (contact.id === id) 
        res.status(200).send(contact) 

    } catch (error) {
        res.status(404).send({"message": "Not found"}) 
    }
};

export const deleteContact = async (req, res) => {
    try {
      const { id } = req.params;
      const contactDelete = await contactsService.removeContact(id);
      if (contactDelete.id === id) 
        res.status(200).send(contactDelete); 
    } catch (error) {
        res.status(404).send({"message": "Not found"})  
    }
};

export const createContact = async (req, res) => {
    try {
        const createContact = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        }
      const contact = await contactsService.addContact(createContact);
      res.status(201).send(contact);
    } catch (error) {
        res.status(404).send({"message": error.message})   
    }

};

export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updateContact = req.body
        if (Object.keys(updateContact).length === 0) {
           return res.status(400).send({"message": "Body must have at least one field"})
        }
   
      const contact = await contactsService.updateContact(id, updateContact)
      res.status(200).send(contact);
    } catch (error) {
        res.status(404).send({"message": error.message}) 
    }
};
