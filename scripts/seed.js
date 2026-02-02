const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Land = require('../src/models/Land');
const Service = require('../src/models/Service');
const Package = require('../src/models/Package');
const Booking = require('../src/models/Booking');
const LeaseRequest = require('../src/models/LeaseRequest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriguard';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Land.deleteMany({});
    await Service.deleteMany({});
    await Package.deleteMany({});
    await Booking.deleteMany({});
    await LeaseRequest.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@agriguard.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        location: 'Delhi',
        contact: '+91-9876543210',
        verificationStatus: true
      }
    });
    await admin.save();
    console.log('Admin user created');

    // Create farmers
    const farmer1Password = await bcrypt.hash('farmer123', 10);
    const farmer1 = new User({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      password: farmer1Password,
      role: 'farmer',
      profile: {
        location: 'Punjab',
        contact: '+91-9876543211',
        verificationStatus: true
      }
    });

    const farmer2Password = await bcrypt.hash('farmer123', 10);
    const farmer2 = new User({
      name: 'Amit Singh',
      email: 'amit@example.com',
      password: farmer2Password,
      role: 'farmer',
      profile: {
        location: 'Haryana',
        contact: '+91-9876543212',
        verificationStatus: true
      }
    });
    await farmer1.save();
    await farmer2.save();
    console.log('Farmers created');

    // Create providers
    const provider1Password = await bcrypt.hash('provider123', 10);
    const provider1 = new User({
      name: 'GreenTech Services',
      email: 'greentech@example.com',
      password: provider1Password,
      role: 'provider',
      profile: {
        location: 'Delhi',
        contact: '+91-9876543213',
        verificationStatus: true
      }
    });

    const provider2Password = await bcrypt.hash('provider123', 10);
    const provider2 = new User({
      name: 'AgriSolutions Ltd',
      email: 'agrisolutions@example.com',
      password: provider2Password,
      role: 'provider',
      profile: {
        location: 'Gurgaon',
        contact: '+91-9876543214',
        verificationStatus: true
      }
    });
    await provider1.save();
    await provider2.save();
    console.log('Providers created');

    // Create lands
    const land1 = new Land({
      title: 'Fertile Wheat Field',
      location: 'Amritsar, Punjab',
      size: { value: 5, unit: 'acres' },
      soilType: 'Loamy',
      waterAvailability: 'Well irrigation',
      leasePrice: 50000,
      leaseDuration: '1 year',
      farmer: farmer1._id,
      availabilityStatus: 'available'
    });

    const land2 = new Land({
      title: 'Rice Paddy Land',
      location: 'Ludhiana, Punjab',
      size: { value: 3, unit: 'acres' },
      soilType: 'Clay',
      waterAvailability: 'Canal water',
      leasePrice: 35000,
      leaseDuration: '6 months',
      farmer: farmer2._id,
      availabilityStatus: 'available'
    });
    await land1.save();
    await land2.save();
    console.log('Lands created');

    // Create services
    const service1 = new Service({
      name: 'Tractor Plowing Service',
      category: 'Plowing',
      price: 2000,
      serviceArea: 'Punjab',
      availabilityDates: [new Date('2024-02-01'), new Date('2024-02-15')],
      description: 'Professional tractor plowing service for farmland preparation',
      provider: provider1._id
    });

    const service2 = new Service({
      name: 'Crop Spraying Service',
      category: 'Pest Control',
      price: 1500,
      serviceArea: 'Haryana',
      availabilityDates: [new Date('2024-02-05'), new Date('2024-02-20')],
      description: 'Expert crop spraying and pest control services',
      provider: provider2._id
    });
    await service1.save();
    await service2.save();
    console.log('Services created');

    // Create packages
    const package1 = new Package({
      name: 'Wheat Cultivation Package',
      crop: 'Wheat',
      duration: '6 months',
      price: 25000,
      features: ['Seeds', 'Fertilizers', 'Pest Control', 'Harvesting'],
      description: 'Complete wheat cultivation package with all necessary inputs',
      provider: provider1._id,
      isActive: true
    });

    const package2 = new Package({
      name: 'Rice Farming Package',
      crop: 'Rice',
      duration: '4 months',
      price: 30000,
      features: ['High-quality seeds', 'Pesticides', 'Irrigation support', 'Technical guidance'],
      description: 'Comprehensive rice farming package for maximum yield',
      provider: provider2._id,
      isActive: true
    });
    await package1.save();
    await package2.save();
    console.log('Packages created');

    // Create bookings
    const booking1 = new Booking({
      farmer: farmer1._id,
      service: service1._id,
      bookingDate: new Date('2024-02-10'),
      status: 'confirmed',
      totalAmount: 2000,
      notes: 'Urgent plowing required'
    });

    const booking2 = new Booking({
      farmer: farmer2._id,
      service: service2._id,
      bookingDate: new Date('2024-02-12'),
      status: 'pending',
      totalAmount: 1500,
      notes: 'Weekly spraying schedule'
    });
    await booking1.save();
    await booking2.save();
    console.log('Bookings created');

    // Create lease requests
    const leaseRequest1 = new LeaseRequest({
      land: land1._id,
      requester: farmer2._id,
      status: 'pending',
      requestedDuration: '6 months',
      proposedPrice: 45000,
      message: 'Interested in leasing this fertile land for rice cultivation'
    });

    const leaseRequest2 = new LeaseRequest({
      land: land2._id,
      requester: farmer1._id,
      status: 'approved',
      requestedDuration: '1 year',
      proposedPrice: 35000,
      message: 'Perfect for wheat farming'
    });
    await leaseRequest1.save();
    await leaseRequest2.save();
    console.log('Lease requests created');

    console.log('Database seeded successfully!');
    console.log('Admin login: admin@agriguard.com / admin123');
    console.log('Farmer login: rajesh@example.com / farmer123');
    console.log('Provider login: greentech@example.com / provider123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
