import * as fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const contactsPath = path.resolve( "db", "contacts.json");

async function readContacts() {
    const data = await fs.readFile(contactsPath, { encoding: 'utf-8' });
    return JSON.parse(data);
}
 function writeContacts(contacts) {
    return fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}

async function listContacts() {
    const contacts = await readContacts();
    return contacts;
}

async function getContactById(contactId) {
 const contacts = await readContacts();
    const contact = contacts.find(contact => contact.id === contactId);
    if (typeof contact === "undefined") return null;

    return contact;
}

async function removeContact(contactId) {
    const contacts = await readContacts();
    const contact = contacts.findIndex(contact => contact.id === contactId);
    if (contact === -1) return null;

    const removedContact = contacts[contact];
    contacts.splice(contact, 1);
    await writeContacts(contacts);
    return removedContact;

}

async function addContact(contact) {
    const contacts = await readContacts();
    const newContact = {
        id: crypto.randomUUID(),
        ...contact, 
    };
    contacts.push(newContact);

    await writeContacts(contacts);

    return newContact;

}

async function updateContact( id, updateContactData) {
    const contacts = await readContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === id);
    if (contactIndex === -1) return null;

   const updatedContact = {...contacts[contactIndex]};
    for (let key in updateContactData) {
        if (updateContactData.hasOwnProperty(key)) {
            updatedContact[key] = updateContactData[key];
        }
    }
    contacts[contactIndex] = updatedContact;
    
    await writeContacts(contacts);

    return contacts[contactIndex];
}

const contactsService = 
 {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact
 };

 export default contactsService;

 