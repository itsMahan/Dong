from rest_framework.permissions import BasePermission, SAFE_METHODS



class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        #Read-Only
        if request.method in SAFE_METHODS:
            return True
        #Update
        return request.user == obj.created_by