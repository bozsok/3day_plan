import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageService } from '../services/PackageService';


export const usePackages = () => {
    const queryClient = useQueryClient();

    const { data: packages = [], isLoading, error } = useQuery({
        queryKey: ['packages'],
        queryFn: PackageService.getPackages,
        staleTime: 1000 * 60 * 5, // 5 percig frissnek tekintjük
    });

    const savePackagesMutation = useMutation({
        mutationFn: PackageService.savePackages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
        },
    });

    const uploadImagesMutation = useMutation({
        mutationFn: PackageService.uploadImages,
    });

    return {
        packages,
        isLoading,
        error,
        savePackages: savePackagesMutation.mutateAsync,
        isSaving: savePackagesMutation.isPending,
        uploadImages: uploadImagesMutation.mutateAsync,
        isUploading: uploadImagesMutation.isPending,
    };
};
