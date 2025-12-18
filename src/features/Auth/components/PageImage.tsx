import { Leaf } from "lucide-react"

export const PageImage = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-green-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 opacity-90 z-10"></div>
            <img
                src="https://images.unsplash.com/photo-1631021967261-c57ee4dfa9bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBiYXNrZXR8ZW58MXx8fHwxNzYwNDA3MzI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fresh produce"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 flex flex-col justify-center px-12 text-white">
                <div className="flex items-center gap-2 mb-8">
                    <Leaf className="w-10 h-10" />
                    <span className="text-3xl">AgriConnect Market</span>
                </div>
                <h1 className="mb-4">Welcome to AgriConnect Market</h1>
                <p className="text-green-50 text-lg">
                    Discover the freshest organic fruits, vegetables, and leafy greens delivered straight to your door.
                </p>
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white">100% Organic</h4>
                            <p className="text-green-50 text-sm">Certified organic produce</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Leaf className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white">Farm Fresh</h4>
                            <p className="text-green-50 text-sm">Delivered within 24 hours</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}