import { getPackageDeliveryStatus } from "../utils/packagesUtils"; // Adjust the import path as needed

export default async function handler(req, res) {
    const { packageId } = req.query;

    if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required' });
    }

    try {
        // Replace the following line with your logic to fetch package data
        const data = await getPackageDeliveryStatus(packageId);

        if (!data) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching package data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
