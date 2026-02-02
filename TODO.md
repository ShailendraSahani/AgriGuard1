# TODO: Implement Lease Request Notifications for Land Owners

## Steps to Complete:
1. Modify `src/app/api/lease-requests/route.ts` to add notification creation for land owners when a lease request is created.
   - After saving the lease request, fetch the land details to get the farmer (land owner) ID.
   - Create a new Notification document with type 'lease', appropriate title and message, and send it to the farmer.
2. Test the implementation to ensure notifications are created correctly.
3. Verify that land owners can view these notifications in their dashboard or notification section.

## Progress:
- [x] Step 1: Edit lease-requests/route.ts to add notification logic.
- [x] Step 2: Test the changes.
- [x] Step 3: Verify notification display.
