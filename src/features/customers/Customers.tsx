import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Card, CardContent } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "../../types";

export function Customers() {
  const { customers, addCustomer, updateCustomer, removeCustomer } = useStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const openNewCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = Date.now();

    const customerData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    };

    if (editingCustomer) {
      await updateCustomer({ ...editingCustomer, ...customerData, updatedAt: now });
    } else {
      await addCustomer({ ...customerData, id: uuidv4(), createdAt: now, updatedAt: now });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
        <Button onClick={openNewCustomer} className="w-full sm:w-auto shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 shadow-sm border-gray-200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {customers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Add your first customer</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6 text-sm">
              Keep all your client details organized in one place for faster quoting.
            </p>
            <Button onClick={openNewCustomer} className="shadow-sm bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-5 w-5" />
              Add Customer
            </Button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            <UsersIcon />
            <p className="mt-2 text-sm">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
                    {customer.email && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <Phone className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="mt-1 flex items-start text-sm text-gray-600">
                        <MapPin className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCustomer(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "New Customer"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            name="name"
            label="Full Name / Company Name *"
            defaultValue={editingCustomer?.name}
            required
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="email"
              type="email"
              label="Email"
              defaultValue={editingCustomer?.email}
            />
            <Input
              name="phone"
              type="tel"
              label="Phone Number"
              defaultValue={editingCustomer?.phone}
            />
          </div>
          <Textarea
            name="address"
            label="Billing Address"
            defaultValue={editingCustomer?.address}
            rows={2}
          />
          <Textarea
            name="notes"
            label="Private Notes"
            defaultValue={editingCustomer?.notes}
            rows={2}
          />
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            {editingCustomer && (
              <Button
                type="button"
                variant="danger"
                className="mr-auto"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this customer?")) {
                    await removeCustomer(editingCustomer.id);
                    setIsModalOpen(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function UsersIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
      <Users className="h-6 w-6 text-gray-400" />
    </div>
  );
}

import { Users } from "lucide-react";
